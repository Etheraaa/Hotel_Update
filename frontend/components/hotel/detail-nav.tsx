import Link from "next/link";

export default function DetailNav() {
  return (
    <nav className="detail-nav">
      <Link className="back-chip" href="/">
        返回主页
      </Link>
      <p className="detail-nav__brand">酒店升房情报</p>
    </nav>
  );
}
