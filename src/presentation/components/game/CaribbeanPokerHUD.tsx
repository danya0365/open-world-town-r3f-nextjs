"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Coins, HandCoins, RotateCcw, MessageSquare, Eye } from "lucide-react";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { useTableStore } from "@/src/presentation/stores/tableStore";
import { usePokerRoundStore } from "@/src/presentation/stores/pokerRoundStore";

export function CaribbeanPokerHUD() {
  const { seats, status, isHost } = useTableStore((state) => ({
    seats: state.seats,
    status: state.status,
    isHost: state.isHost,
  }));
  const { phase, winningPlayerIds, playerBets, lastAction, community, potTotal, nextRoundStartAt } =
    usePokerRoundStore((state) => ({
      phase: state.phase,
      winningPlayerIds: state.winningPlayerIds,
      playerBets: state.playerBets,
      lastAction: state.lastAction,
      community: state.community,
      potTotal: state.potTotal,
      nextRoundStartAt: state.nextRoundStartAt,
    }));
  const players = useMultiplayerStore((state) => state.players);

  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (!nextRoundStartAt) {
      setCountdown(0);
      return undefined;
    }

    const updateCountdown = () => {
      const remainingMs = nextRoundStartAt - Date.now();
      setCountdown(remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0);
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [nextRoundStartAt]);

  const activePlayers = useMemo(() => seats.filter((seat) => seat.playerId), [seats]);
  const normalizedPhase = phase.replace(/_/g, " ");
  const lastActionPlayer = lastAction ? players.get(lastAction.playerId)?.username ?? lastAction.playerId : null;

  return (
    <div className="pointer-events-none absolute top-8 left-1/2 z-30 w-[420px] -translate-x-1/2">
      <div className="pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/85 px-6 py-4 shadow-2xl backdrop-blur-md transition-all duration-300">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-sky-200">
          <span className="flex items-center gap-2">
            <Crown size={14} /> Caribbean Poker
          </span>
          <span className="text-amber-300">
            {status === "in_progress" ? "Game On" : status}
          </span>
        </div>

        {countdown > 0 && (
          <div className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-emerald-200">
            รอบถัดไปจะเริ่มใน <span className="font-semibold text-emerald-300">{countdown}s</span>
          </div>
        )}

        <div className="mt-4 space-y-3 text-sm text-slate-100">
          <div className="flex items-center gap-3">
            <HandCoins size={16} className="text-emerald-300" />
            <span>
              Phase: <strong className="text-white capitalize">{normalizedPhase}</strong>
            </span>
          </div>

          <div className="flex items-start gap-3">
            <Coins size={16} className="mt-0.5 text-amber-200" />
            <div className="space-y-1">
              <p className="text-slate-200">
                Players at table: {activePlayers.length} / {seats.length}
              </p>
              <p className="text-xs text-emerald-200">
                Pot Total: <span className="font-semibold text-emerald-300">{potTotal}</span>
              </p>
              <ul className="ml-4 list-disc text-xs text-slate-300">
                {activePlayers.map((seat) => {
                  const playerId = seat.playerId;
                  const username = playerId ? players.get(playerId)?.username : null;
                  const betState = playerId ? playerBets[playerId] : undefined;
                  return (
                    <li key={seat.playerId ?? seat.committedFrame} className="capitalize">
                      <span className="font-medium text-slate-100">{username ?? "Unknown Player"}</span>
                      {betState && (
                        <span className="ml-2 text-slate-400">
                          ante:{" "}
                          <span className="text-emerald-300">{betState.ante}</span> / bet:{" "}
                          <span className="text-amber-300">{betState.bet}</span>
                          {betState.hasFolded && <span className="ml-2 text-rose-300">(folded)</span>}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {community.dealerHand.length > 0 && (
            <div className="flex items-start gap-3 text-indigo-200">
              <Eye size={16} className="mt-0.5" />
              <div className="text-xs">
                <p className="text-slate-100">Dealer Hand</p>
                <p className="uppercase tracking-wide">
                  {community.dealerHand.map((card, index) => (
                    <span key={`${card.rank}${card.suit}-${index}`} className="mr-2 inline-block rounded bg-white/5 px-2 py-1 text-sm">
                      {card.rank}
                      {card.suit}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          )}

          {activePlayers.length > 0 && (
            <div className="space-y-2">
              {activePlayers.map((seat) => {
                const playerId = seat.playerId;
                if (!playerId) {
                  return null;
                }

                const cards = community.playerHands[playerId];
                if (!cards || cards.length === 0) {
                  return null;
                }

                const username = players.get(playerId)?.username ?? playerId;

                return (
                  <div key={playerId} className="flex items-start gap-3 text-xs text-slate-200">
                    <Eye size={16} className="mt-0.5 text-sky-300" />
                    <div>
                      <p className="text-slate-100">{username}</p>
                      <p className="uppercase tracking-wide">
                        {cards.map((card, index) => (
                          <span key={`${playerId}-${card.rank}${card.suit}-${index}`} className="mr-2 inline-block rounded bg-white/5 px-2 py-1 text-sm">
                            {card.rank}
                            {card.suit}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {lastAction && (
            <div className="flex items-start gap-3 text-sky-300">
              <MessageSquare size={16} className="mt-0.5" />
              <div className="text-xs text-slate-200">
                <p className="text-slate-100">คำสั่งล่าสุด</p>
                <p>
                  {lastActionPlayer ?? lastAction.playerId} : {lastAction.action}
                  {lastAction.amount !== undefined && lastAction.amount !== null
                    ? ` (${lastAction.amount})`
                    : null}
                </p>
              </div>
            </div>
          )}

          {winningPlayerIds.length > 0 && (
            <div className="flex items-start gap-3 text-emerald-300">
              <RotateCcw size={16} className="mt-0.5" />
              <div>
                <p className="text-slate-100">รอบก่อนหน้า - ผู้ชนะ</p>
                <ul className="ml-3 list-disc text-xs text-emerald-200">
                  {winningPlayerIds.map((playerId) => (
                    <li key={playerId}>{players.get(playerId)?.username ?? playerId}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {isHost && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-amber-200">
            คุณเป็นโฮสต์ สามารถเริ่มรอบใหม่ได้ผ่านปุ่ม Start Game ใน Table HUD
          </div>
        )}
      </div>
    </div>
  );
}
