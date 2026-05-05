import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div>
        <p className="site-header__eyebrow">UPGRADE INTELLIGENCE</p>
        <p className="site-header__title">酒店升房情报</p>
      </div>
      <div className="site-header__actions">
        <Link className="submit-chip submit-chip--secondary" href="/generator">
          要饭话术生成
        </Link>
        <Link className="submit-chip" href="/submit">
          投稿入口
        </Link>
      </div>
    </header>
  );
}
