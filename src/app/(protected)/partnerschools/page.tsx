import { Suspense } from "react";
import PartnerSchoolsClient from "./PartnerSchoolsClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PartnerSchoolsClient />
    </Suspense>
  );
}
