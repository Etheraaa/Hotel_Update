import SubmitPage from "../../components/submit/submit-page";
import { getSubmissionApi } from "../../lib/server-api";

export const dynamic = "force-dynamic";

export default async function Page() {
  const meta = getSubmissionApi().getSubmissionMeta();

  return <SubmitPage memberTiers={meta.member_tiers} />;
}
