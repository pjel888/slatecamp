import { getReviewCalendarData } from "@/lib/actions/analytics/get-review-calendar";
import { ReviewCalendar } from "./ReviewCalendar";

export const ReviewCalendarServer = async () => {
  const data = await getReviewCalendarData();

  return <ReviewCalendar data={data} />;
};
