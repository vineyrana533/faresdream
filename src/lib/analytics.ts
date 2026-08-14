/**
 * Mixpanel wrapper. Browser-only: every call no-ops during SSR so routes stay
 * isomorphic. The library is dynamically imported after hydration.
 */
const TOKEN = "def37fc319d4408b68bf1d198a2ba53a";

type Props = Record<string, unknown>;

let ready: Promise<typeof import("mixpanel-browser").default | null> | null = null;

const load = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!ready) {
    ready = import("mixpanel-browser")
      .then(({ default: mixpanel }) => {
        mixpanel.init(TOKEN, { track_pageview: true, persistence: "localStorage" });
        mixpanel.register({ site_domain: "asairspace.com" });
        return mixpanel;
      })
      .catch(() => null);
  }
  return ready;
};

/** Call once from the root layout, after hydration. */
export const initAnalytics = () => {
  void load().then((mp) => {
    if (!mp) return;
    const clickId = new URLSearchParams(window.location.search).get("click_id");
    if (clickId) mp.register({ click_id: clickId });
  });
};

export const track = (event: string, props?: Props) => {
  void load().then((mp) => mp?.track(event, props));
};

export const registerSuperProps = (props: Props) => {
  void load().then((mp) => mp?.register(props));
};
