import { useClientClock } from "../hooks/useClientClock";
import { XpClock } from "./XpClock";
import { XpTooltip } from "./XpTooltip";

const LOCATION_TOOLTIP = "Florianópolis, Brazil · UTC−3";

/**
 * The taskbar's bottom-right notification area: a Brazilian flag + the
 * current Florianópolis time, styled like a classic XP system tray
 * (a shade lighter/cooler than the taskbar itself). Hovering or focusing
 * it reveals an XP-styled tooltip naming the location — a small, explorable
 * detail rather than a competing visual element.
 */
export function XpSystemTray() {
  const time = useClientClock();

  return (
    <div className="flex h-[calc(100%-6px)] flex-shrink-0 items-center rounded-[2px] border border-[#0c3f8a] bg-linear-to-b from-xp-tray-start to-xp-tray-end px-2 shadow-[inset_1px_1px_0_rgba(255,255,255,0.35),inset_-1px_-1px_0_rgba(0,0,0,0.25)]">
      <XpTooltip label={LOCATION_TOOLTIP} align="right">
        <button
          type="button"
          className="cursor-default border-0 bg-transparent p-0 select-none"
          aria-label={`Florianópolis time${time ? `, ${time}` : ""} (UTC−3)`}
        >
          <XpClock time={time} />
        </button>
      </XpTooltip>
    </div>
  );
}
