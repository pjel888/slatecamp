import { getSubjectMasteryData } from "@/lib/actions/mastery-actions";
import { SubjectMasteryCard } from "./SubjectMasteryCard";

export const SubjectMasteryServer = async () => {
  const data = await getSubjectMasteryData();

  return <SubjectMasteryCard data={data} />;
};
