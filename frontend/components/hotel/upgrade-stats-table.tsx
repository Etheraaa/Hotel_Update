import type { UpgradeStatsResponse } from "../../types/hotel";
import EmptyState from "../common/empty-state";

export default function UpgradeStatsTable({ stats }: { stats: UpgradeStatsResponse }) {
  if (stats.insufficient) {
    return (
      <EmptyState
        title="当前样本不足"
        description="该酒店暂未形成可展示的会员等级升房分布"
      />
    );
  }

  return (
    <section className="stats-card">
      <h2 className="stats-card__title">各会员等级升房情况</h2>
      <p className="stats-card__subtitle">单元格展示：样本数 + 在该等级成功升级样本中的占比</p>
      <table className="stats-table">
        <thead>
          <tr>
            <th>会员等级</th>
            {stats.columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
            <th>成功样本</th>
          </tr>
        </thead>
        <tbody>
          {stats.rows.map((row) => (
            <tr key={row.member_tier}>
              <td className="stats-table__tier">{row.member_tier}</td>
              {stats.columns.map((column) => (
                <td key={column}>{row.buckets[column]?.display ?? "0 / 0%"}</td>
              ))}
              <td>{row.success_total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
