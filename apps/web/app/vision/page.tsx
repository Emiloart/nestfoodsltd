import { permanentRedirect } from "next/navigation";

export default function VisionRedirectPage() {
  permanentRedirect("/about");
}
