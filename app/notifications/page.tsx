import { redirect } from "next/navigation";

// Notifications are now a side drawer opened from the top-bar bell; this legacy
// route just sends visitors home.
export default function NotificationsPage() {
  redirect("/");
}
