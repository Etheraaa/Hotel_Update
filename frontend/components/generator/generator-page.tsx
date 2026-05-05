import Link from "next/link";
import type { PhrasingMeta } from "../../types/phrasing";
import GeneratorForm from "./generator-form";

type GeneratorPageProps = {
  meta: PhrasingMeta;
};

export default function GeneratorPage({ meta }: GeneratorPageProps) {
  return (
    <main className="submit-shell">
      <header className="detail-nav">
        <div className="submit-nav__actions">
          <Link className="back-chip" href="/">
            返回主页
          </Link>
          <span className="submit-status-chip">要饭话术生成</span>
        </div>
        <p className="detail-nav__brand">酒店升房情报</p>
      </header>

      <section className="generator-hero">
        <div>
          <p className="submit-hero__eyebrow">升房沟通辅助 / 口语生成</p>
          <h1 className="submit-hero__title">把诉求整理成一句更自然的话</h1>
          <p className="submit-hero__copy">
            选好酒店、会员等级和这次最在意的诉求，我们会帮你整理成一段更顺口、更体面的沟通话术。
          </p>
          <div className="detail-hero__divider submit-hero__divider" />
          <div className="detail-meta-row submit-hero__meta">
            <span>适合入住前快速整理</span>
            <span>默认偏自然礼貌</span>
            <span>支持不同语气强度</span>
          </div>
        </div>
      </section>

      <GeneratorForm meta={meta} />
    </main>
  );
}
