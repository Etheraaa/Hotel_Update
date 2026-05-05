type SearchBarProps = {
  keyword?: string;
};

export default function SearchBar({ keyword }: SearchBarProps) {
  return (
    <div className="search-box">
      <div className="search-box__field-wrap">
        <span className="search-box__icon" aria-hidden="true" />
        <input
          name="keyword"
          placeholder="搜索具体酒店，例如：上海静安瑞吉酒店"
          defaultValue={keyword}
        />
      </div>
      <button type="submit">搜索酒店</button>
    </div>
  );
}
