import type { FilterOptions, HotelListQuery } from "../../types/hotel";

type FilterBarProps = {
  filters: FilterOptions;
  selected?: HotelListQuery;
};

function FilterSelect({
  label,
  name,
  defaultLabel,
  options,
  value
}: {
  label: string;
  name: keyof HotelListQuery;
  defaultLabel: string;
  options: string[];
  value?: string;
}) {
  return (
    <div className="filter-select">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={value ?? ""}>
        <option value="">{defaultLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar({ filters, selected }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <FilterSelect
        label="酒店集团"
        name="group"
        defaultLabel="全部集团"
        options={filters.groups}
        value={selected?.group}
      />
      <FilterSelect
        label="酒店品牌"
        name="brand"
        defaultLabel="全部品牌"
        options={filters.brands}
        value={selected?.brand}
      />
      <FilterSelect
        label="城市"
        name="city"
        defaultLabel="全部城市"
        options={filters.cities}
        value={selected?.city}
      />
    </div>
  );
}
