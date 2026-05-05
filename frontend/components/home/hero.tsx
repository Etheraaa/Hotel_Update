import EditorialSummaryCard from "./editorial-summary-card";
import SearchBar from "./search-bar";

type HeroProps = {
  keyword?: string;
};

export default function Hero({ keyword }: HeroProps) {
  return (
    <section className="home-hero">
      <div className="home-hero__top">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">面向常旅客玩家的公开情报网站</p>
          <p className="home-hero__copy">
            你可以直接搜索某一家酒店，也可以从集团、城市、品牌切入，先看每家酒店的汇总结论，再进入详情查看不同会员等级的升房分布。
          </p>
        </div>
        <EditorialSummaryCard />
      </div>
      <SearchBar keyword={keyword} />
    </section>
  );
}
