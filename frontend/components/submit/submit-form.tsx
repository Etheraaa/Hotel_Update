"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  createSubmission,
  getSubmissionRoomOptions,
  searchSubmissionHotels
} from "../../lib/api";
import type { SubmissionHotelSearchItem, SubmissionPayload, SubmissionRoomOption } from "../../types/hotel";

type SubmitFormProps = {
  memberTiers: string[];
};

type FormErrors = Partial<Record<keyof SubmissionPayload, string>>;

const initialForm: SubmissionPayload = {
  hotel_id: "",
  member_tier: "",
  booked_room_raw: "",
  upgraded_room_raw: "",
  observed_at: "",
  stay_context: ""
};

export default function SubmitForm({ memberTiers }: SubmitFormProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [hotelResults, setHotelResults] = useState<SubmissionHotelSearchItem[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<SubmissionHotelSearchItem | null>(null);
  const [roomOptions, setRoomOptions] = useState<SubmissionRoomOption[]>([]);
  const [form, setForm] = useState<SubmissionPayload>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

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

  const roomSelectDisabled = useMemo(
    () => !selectedHotel || isLoadingRooms || roomOptions.length === 0,
    [isLoadingRooms, roomOptions.length, selectedHotel]
  );

  function updateField<K extends keyof SubmissionPayload>(key: K, value: SubmissionPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setNotice(null);
  }

  async function handleHotelSelect(hotel: SubmissionHotelSearchItem) {
    setSelectedHotel(hotel);
    setQuery(hotel.hotel_name);
    setHotelResults([]);
    setRoomOptions([]);
    setNotice(null);
    setErrors((current) => ({
      ...current,
      hotel_id: undefined,
      booked_room_raw: undefined,
      upgraded_room_raw: undefined
    }));
    setForm((current) => ({
      ...current,
      hotel_id: hotel.hotel_id,
      booked_room_raw: "",
      upgraded_room_raw: ""
    }));
    setIsLoadingRooms(true);

    try {
      const response = await getSubmissionRoomOptions(hotel.hotel_id);
      setRoomOptions(response.items);
    } catch {
      setRoomOptions([]);
    } finally {
      setIsLoadingRooms(false);
    }
  }

  function handleHotelQueryChange(value: string) {
    setQuery(value);
    setSelectedHotel(null);
    setRoomOptions([]);
    setForm((current) => ({
      ...current,
      hotel_id: "",
      booked_room_raw: "",
      upgraded_room_raw: ""
    }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.hotel_id) nextErrors.hotel_id = "请选择酒店";
    if (!form.member_tier) nextErrors.member_tier = "请选择会员等级";
    if (!form.booked_room_raw) nextErrors.booked_room_raw = "请选择预订房型";
    if (!form.upgraded_room_raw) nextErrors.upgraded_room_raw = "请选择最终房型";
    if (!form.observed_at) nextErrors.observed_at = "请选择入住时间";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      setNotice("请补全必填字段后再提交。");
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      await createSubmission(form);
      setNotice("投稿成功，感谢补充这条入住观察。");
      setQuery("");
      setSelectedHotel(null);
      setHotelResults([]);
      setRoomOptions([]);
      setForm(initialForm);
      setErrors({});
    } catch {
      setNotice("提交失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="submit-form-card">
      <div className="submit-form-card__header">
        <div>
          <h2 className="submit-form-card__title">投稿信息</h2>
          <p className="submit-form-card__subtitle">几项核心信息，尽量在一分钟内完成。</p>
        </div>
        <span className="submit-form-card__chip">轻量填写</span>
      </div>

      {notice ? (
        <div
          className={`submit-banner ${
            notice.includes("投稿成功") ? "submit-banner--success" : "submit-banner--error"
          }`}
        >
          {notice}
        </div>
      ) : null}

      <form className="submit-form" onSubmit={handleSubmit}>
        <div className="submit-field">
          <label htmlFor="submit-hotel">酒店</label>
          <input
            id="submit-hotel"
            autoComplete="off"
            className={errors.hotel_id ? "submit-input submit-input--error" : "submit-input"}
            onChange={(event) => handleHotelQueryChange(event.target.value)}
            placeholder="搜索并选择酒店"
            value={query}
          />
          <p className="submit-helper">
            输入酒店名称即可快速选择，选定后可继续补充后续字段。
          </p>
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
                    onMouseDown={() => void handleHotelSelect(hotel)}
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

        <div className="submit-form__grid">
          <div className="submit-field">
            <label htmlFor="submit-tier">会员等级</label>
            <select
              id="submit-tier"
              className={errors.member_tier ? "submit-input submit-input--error" : "submit-input"}
              onChange={(event) => updateField("member_tier", event.target.value)}
              value={form.member_tier}
            >
              <option value="">选择会员等级</option>
              {memberTiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
            {errors.member_tier ? <p className="submit-error">{errors.member_tier}</p> : null}
          </div>

          <div className="submit-field">
            <label htmlFor="submit-booked-room">预订房型</label>
            <select
              disabled={roomSelectDisabled}
              id="submit-booked-room"
              className={errors.booked_room_raw ? "submit-input submit-input--error" : "submit-input"}
              onChange={(event) => updateField("booked_room_raw", event.target.value)}
              value={form.booked_room_raw}
            >
              <option value="">
                {selectedHotel ? (isLoadingRooms ? "正在加载房型" : "选择预订房型") : "待选酒店后解锁"}
              </option>
              {roomOptions.map((option) => (
                <option key={option.room_name} value={option.room_name}>
                  {option.room_name}
                </option>
              ))}
            </select>
            {errors.booked_room_raw ? <p className="submit-error">{errors.booked_room_raw}</p> : null}
          </div>

          <div className="submit-field">
            <label htmlFor="submit-upgraded-room">最终房型</label>
            <select
              disabled={roomSelectDisabled}
              id="submit-upgraded-room"
              className={errors.upgraded_room_raw ? "submit-input submit-input--error" : "submit-input"}
              onChange={(event) => updateField("upgraded_room_raw", event.target.value)}
              value={form.upgraded_room_raw}
            >
              <option value="">
                {selectedHotel ? (isLoadingRooms ? "正在加载房型" : "选择最终房型") : "待选酒店后解锁"}
              </option>
              {roomOptions.map((option) => (
                <option key={option.room_name} value={option.room_name}>
                  {option.room_name}
                </option>
              ))}
            </select>
            {errors.upgraded_room_raw ? <p className="submit-error">{errors.upgraded_room_raw}</p> : null}
          </div>

          <div className="submit-field">
            <label htmlFor="submit-date">入住时间</label>
            <input
              id="submit-date"
              className={errors.observed_at ? "submit-input submit-input--error" : "submit-input"}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => updateField("observed_at", event.target.value)}
              type="date"
              value={form.observed_at}
            />
            {errors.observed_at ? <p className="submit-error">{errors.observed_at}</p> : null}
          </div>
        </div>

        <div className="submit-field">
          <label htmlFor="submit-context">补充说明</label>
          <textarea
            id="submit-context"
            className="submit-textarea"
            onChange={(event) => updateField("stay_context", event.target.value)}
            placeholder="例如：到店时间较晚、当天入住率较高、是否有庆祝需求等。"
            rows={5}
            value={form.stay_context ?? ""}
          />
          <p className="submit-helper">非必填，但建议填写有助于理解样本上下文。</p>
        </div>

        <div className="submit-footer-note">
          <div>
            <p className="submit-footer-note__label">提交后动作</p>
            <p className="submit-footer-note__text">
              感谢你的补充，这些真实入住体验会让内容更扎实，也更值得反复参考。
            </p>
          </div>
          <button className="submit-primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "提交中..." : "提交样本"}
          </button>
        </div>
      </form>
    </section>
  );
}
