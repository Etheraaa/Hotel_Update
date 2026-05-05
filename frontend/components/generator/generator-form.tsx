"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { generatePhrasing, searchSubmissionHotels } from "../../lib/api";
import type { SubmissionHotelSearchItem } from "../../types/hotel";
import type { PhrasingMeta, PhrasingPayload } from "../../types/phrasing";

type GeneratorFormProps = {
  meta: PhrasingMeta;
};

type FormErrors = Partial<Record<"hotel_id" | "membership_level" | "goal_request" | "tone", string>>;

const initialForm: PhrasingPayload = {
  hotel_id: "",
  scenario_ids: [],
  membership_level: "",
  goal_request: "",
  tone: "",
  additional_context: ""
};

export default function GeneratorForm({ meta }: GeneratorFormProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [hotelResults, setHotelResults] = useState<SubmissionHotelSearchItem[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<SubmissionHotelSearchItem | null>(null);
  const [form, setForm] = useState<PhrasingPayload>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function runSearch() {
      if (selectedHotel || deferredQuery.trim().length === 0) {
        setHotelResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const response = await searchSubmissionHotels(deferredQuery.trim());
        if (!ignore) {
          setHotelResults(response.items);
        }
      } catch {
        if (!ignore) {
          setHotelResults([]);
        }
      } finally {
        if (!ignore) {
          setIsSearching(false);
        }
      }
    }

    void runSearch();

    return () => {
      ignore = true;
    };
  }, [deferredQuery, selectedHotel]);

  const canGenerate = useMemo(
    () =>
      Boolean(form.hotel_id && form.membership_level && form.goal_request && form.tone) &&
      !isGenerating,
    [form.goal_request, form.hotel_id, form.membership_level, form.tone, isGenerating]
  );

  function updateField<K extends keyof PhrasingPayload>(key: K, value: PhrasingPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice(null);
    setErrors((current) => ({ ...current, [key as keyof FormErrors]: undefined }));
  }

  function handleScenarioToggle(scenarioId: string) {
    setForm((current) => ({
      ...current,
      scenario_ids: current.scenario_ids.includes(scenarioId)
        ? current.scenario_ids.filter((id) => id !== scenarioId)
        : [...current.scenario_ids, scenarioId]
    }));
    setNotice(null);
  }

  function handleHotelQueryChange(value: string) {
    setQuery(value);
    setSelectedHotel(null);
    setHotelResults([]);
    setMessage("");
    setNotice(null);
    setForm((current) => ({ ...current, hotel_id: "" }));
    setErrors((current) => ({ ...current, hotel_id: undefined }));
  }

  function handleHotelSelect(hotel: SubmissionHotelSearchItem) {
    setSelectedHotel(hotel);
    setQuery(hotel.hotel_name);
    setHotelResults([]);
    setMessage("");
    setNotice(null);
    setForm((current) => ({ ...current, hotel_id: hotel.hotel_id }));
    setErrors((current) => ({ ...current, hotel_id: undefined }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.hotel_id) nextErrors.hotel_id = "请选择酒店";
    if (!form.membership_level) nextErrors.membership_level = "请选择会员等级";
    if (!form.goal_request) nextErrors.goal_request = "请选择目标诉求";
    if (!form.tone) nextErrors.tone = "请选择沟通语气";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      setNotice("请先补全必要信息。");
      return;
    }

    setIsGenerating(true);
    setNotice(null);

    try {
      const response = await generatePhrasing(form);
      setMessage(response.message);
    } catch (error) {
      setNotice(
        error instanceof Error && error.message.includes("503")
          ? "生成服务尚未配置完成，请稍后再试。"
          : "生成暂时不可用，请稍后再试。"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!message) return;

    try {
      await navigator.clipboard.writeText(message);
      setNotice("话术已复制。");
    } catch {
      setNotice("复制失败，请手动复制。");
    }
  }

  return (
    <section className="generator-card">
      <div className="generator-card__header">
        <div>
          <h2 className="submit-form-card__title">生成信息</h2>
          <p className="submit-form-card__subtitle">先补充关键信息，再生成一段可以直接发给酒店的话。</p>
        </div>
        <span className="submit-form-card__chip">一句短版 + 完整表达</span>
      </div>

      {notice ? (
        <div
          className={`submit-banner ${
            notice.includes("已复制") ? "submit-banner--success" : "submit-banner--error"
          }`}
        >
          {notice}
        </div>
      ) : null}

      <div className="generator-layout">
        <form className="submit-form generator-form" onSubmit={handleGenerate}>
          <div className="submit-field">
            <label htmlFor="generator-hotel">酒店</label>
            <input
              id="generator-hotel"
              autoComplete="off"
              className={errors.hotel_id ? "submit-input submit-input--error" : "submit-input"}
              onChange={(event) => handleHotelQueryChange(event.target.value)}
              placeholder="搜索并选择酒店"
              value={query}
            />
            <p className="submit-helper">酒店名来自现有酒店库，选中后再继续填写其余信息。</p>
            {errors.hotel_id ? <p className="submit-error">{errors.hotel_id}</p> : null}
            {!selectedHotel && (hotelResults.length > 0 || isSearching) ? (
              <div className="submit-search-results">
                {isSearching && hotelResults.length === 0 ? (
                  <p className="submit-search-empty">正在搜索酒店...</p>
                ) : (
                  hotelResults.map((hotel) => (
                    <button
                      className="submit-search-item"
                      key={hotel.hotel_id}
                      onMouseDown={() => handleHotelSelect(hotel)}
                      type="button"
                    >
                      <strong>{hotel.hotel_name}</strong>
                      <span>
                        {hotel.hotel_group} / {hotel.hotel_brand} / {hotel.city}
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>

          <div className="generator-scenarios">
            <p className="generator-scenarios__label">入住情境</p>
            <div className="generator-scenarios__chips">
              {meta.scenarios.map((scenario) => {
                const active = form.scenario_ids.includes(scenario.id);

                return (
                  <button
                    className={active ? "generator-chip generator-chip--active" : "generator-chip"}
                    key={scenario.id}
                    onClick={() => handleScenarioToggle(scenario.id)}
                    type="button"
                  >
                    {scenario.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="submit-form__grid">
            <div className="submit-field">
              <label htmlFor="generator-tier">会员等级</label>
              <select
                id="generator-tier"
                className={
                  errors.membership_level ? "submit-input submit-input--error" : "submit-input"
                }
                onChange={(event) => updateField("membership_level", event.target.value)}
                value={form.membership_level}
              >
                <option value="">选择会员等级</option>
                {meta.member_tiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              {errors.membership_level ? <p className="submit-error">{errors.membership_level}</p> : null}
            </div>

            <div className="submit-field">
              <label htmlFor="generator-goal">目标诉求</label>
              <select
                id="generator-goal"
                className={errors.goal_request ? "submit-input submit-input--error" : "submit-input"}
                onChange={(event) => updateField("goal_request", event.target.value)}
                value={form.goal_request}
              >
                <option value="">选择目标诉求</option>
                {meta.goal_requests.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
              {errors.goal_request ? <p className="submit-error">{errors.goal_request}</p> : null}
            </div>

            <div className="submit-field">
              <label htmlFor="generator-tone">沟通语气</label>
              <select
                id="generator-tone"
                className={errors.tone ? "submit-input submit-input--error" : "submit-input"}
                onChange={(event) => updateField("tone", event.target.value)}
                value={form.tone}
              >
                <option value="">选择沟通语气</option>
                {meta.tones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
              {errors.tone ? <p className="submit-error">{errors.tone}</p> : null}
            </div>
          </div>

          <div className="submit-field">
            <label htmlFor="generator-context">补充背景</label>
            <textarea
              id="generator-context"
              className="submit-textarea"
              onChange={(event) => updateField("additional_context", event.target.value)}
              placeholder="例如：这次是纪念日、会晚到、很在意安静和景观等。"
              rows={5}
              value={form.additional_context ?? ""}
            />
            <p className="submit-helper">可选，补一句真实情境通常会更自然。</p>
          </div>

          <div className="generator-submit-row">
            <button className="submit-primary-button" disabled={!canGenerate} type="submit">
              {isGenerating ? "生成中..." : "生成话术"}
            </button>
          </div>
        </form>

        <aside className="generator-output">
          <div className="generator-output__header">
            <div>
              <h3 className="generator-output__title">生成结果</h3>
              <p className="generator-output__subtitle">生成后可直接复制，再按你的口吻做微调。</p>
            </div>
            <button
              className="generator-copy-button"
              disabled={!message}
              onClick={() => void handleCopy()}
              type="button"
            >
              复制话术
            </button>
          </div>

          <div className="generator-output__body">
            {message ? (
              <p className="generator-output__text">{message}</p>
            ) : (
              <p className="generator-output__placeholder">
                这里会出现一段更自然、礼貌、带一点策略性的沟通话术。
              </p>
            )}
          </div>

        </aside>
      </div>
    </section>
  );
}
