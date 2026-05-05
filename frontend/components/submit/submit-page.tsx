import Link from "next/link";
import SubmitForm from "./submit-form";

type SubmitPageProps = {
  memberTiers: string[];
};

export default function SubmitPage({ memberTiers }: SubmitPageProps) {
  return (
    <main className="submit-shell">
      <header className="detail-nav">
        <div className="submit-nav__actions">
          <Link className="back-chip" href="/">
            返回主页
          </Link>
          <span className="submit-status-chip">投稿入口已开启</span>
        </div>
        <p className="detail-nav__brand">酒店升房情报</p>
      </header>

      <section className="submit-hero">
        <div>
          <p className="submit-hero__eyebrow">投稿入口 / 旅行者观察 / 轻量记录</p>
          <h1 className="submit-hero__title">补充你的升房样本，让下一条情报更有参考价值</h1>
          <p className="submit-hero__copy">
            留下这次入住体验里的关键信息，让真实观察被更好地阅读、比较与参考。整页只保留必要字段，尽量在一分钟内完成。
          </p>
          <div className="detail-hero__divider submit-hero__divider" />
          <div className="detail-meta-row submit-hero__meta">
            <span>填写约 1 分钟</span>
            <span>只保留必要字段</span>
            <span>适合随手补充一条入住观察</span>
          </div>
        </div>

        <aside className="submit-note-card">
          <p className="submit-note-card__label">填写建议</p>
          <p className="submit-note-card__text">
            越具体的房型名称、入住日期和当时情境，越能帮助后来的读者快速理解这次升级体验。
          </p>
        </aside>
      </section>

      <section className="submit-layout">
        <SubmitForm memberTiers={memberTiers} />

        <aside className="submit-side-card">
          <h2 className="submit-side-card__title">填写小贴士</h2>
          <p className="submit-side-card__subtitle">
            这一栏不讲系统流程，只保留对填写体验真正有帮助的提示。
          </p>
          <ol className="submit-steps">
            <li>
              <strong>1. 写清日期</strong>
              <span>入住日期越准确，越方便别人判断这次体验处在什么时段与价格环境里。</span>
            </li>
            <li>
              <strong>2. 保留房型原名</strong>
              <span>如果你记得预订房型和最终房型的官方叫法，参考价值通常会更高。</span>
            </li>
            <li>
              <strong>3. 补一句情境</strong>
              <span>像高入住率、纪念日、晚到店、景观偏好这类细节，往往最值得补充。</span>
            </li>
            <li>
              <strong>4. 简短就够好</strong>
              <span>不需要长篇描述，只要把这次升级的核心信息说清楚，就已经很有帮助。</span>
            </li>
          </ol>
        </aside>
      </section>
    </main>
  );
}
