import { type PropsWithChildren } from "react";
import { NavAdmin } from "./NavAdmin";

export default function AdminLayout(props: PropsWithChildren) {
  return (
    <div className="flex-col">
      <NavAdmin />

      <main>{props.children}</main>
    </div>
  );
}
