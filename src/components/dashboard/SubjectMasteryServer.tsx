import { getSubjectMasteryData } from "@/lib/actions/mastery-actions";
import { SubjectMasteryCard } from "./SubjectMasteryCard";

interface SubjectMasteryServerProps {
  variant?: 'default' | 'compact'
}

export const SubjectMasteryServer = async ({
  variant = 'default',
}: SubjectMasteryServerProps) => {
  const data = await getSubjectMasteryData();

  return <SubjectMasteryCard data={data} variant={variant} />;
};
