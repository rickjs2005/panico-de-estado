import type { RouteDef, RouteId } from "../types";
import { flavio } from "./flavio";
import { lula } from "./lula";

export const ROUTES: Record<RouteId, RouteDef> = { lula, flavio };

export const ROUTE_ORDER: RouteId[] = ["lula", "flavio"];

export const otherRoute = (id: RouteId): RouteId => (id === "lula" ? "flavio" : "lula");
