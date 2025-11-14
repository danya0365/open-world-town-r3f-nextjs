"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Hand, LogIn, LogOut, Play, Users } from "lucide-react";
import { useTableStore } from "@/src/presentation/stores/tableStore";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { usePokerRoundStore } from "@/src/presentation/stores/pokerRoundStore";
import type { PokerActionType } from "@/src/presentation/stores/tableStore";

const JOIN_KEY = "e";
const LEAVE_KEY = "q";

export function TableInteractionHUD() {
  const seats = useTableStore((state) => state.seats);
  const focusedSeatIndex = useTableStore((state) => state.focusedSeatIndex);
  const status = useTableStore((state) => state.status);
  const isHost = useTableStore((state) => state.isHost);
  const joinSeat = useTableStore((state) => state.joinSeat);
  const leaveSeat = useTableStore((state) => state.leaveSeat);
  const requestTableStart = useTableStore((state) => state.requestTableStart);
  const sendPokerAction = useTableStore((state) => state.sendPokerAction);

  const myPlayerId = useMultiplayerStore((state) => state.myPlayerId);
  const players = useMultiplayerStore((state) => state.players);
  const pokerPhase = usePokerRoundStore((state) => state.phase);
  const actionFeedback = usePokerRoundStore((state) => state.lastActionFeedback);
  const setActionFeedback = usePokerRoundStore((state) => state.setActionFeedback);
  const myBetState = usePokerRoundStore((state) =>
    myPlayerId ? state.playerBets[myPlayerId] ?? null : null
  );

  const mySeatIndex = useMemo(() => {
    if (!myPlayerId) {
      return -1;
    }

    return seats.findIndex((seat) => seat.playerId === myPlayerId);
  }, [seats, myPlayerId]);

  const focusedSeat = focusedSeatIndex !== null ? seats[focusedSeatIndex] : null;
  const focusedOccupiedByOther = Boolean(
    focusedSeat?.playerId && focusedSeat.playerId !== myPlayerId
  );

  const canJoinFocusedSeat =
    focusedSeatIndex !== null && !focusedOccupiedByOther && mySeatIndex === -1;

  const canLeaveSeat = mySeatIndex !== -1;

  const allSeatsFilled = seats.length > 0 && seats.every((seat) => Boolean(seat.playerId));

  const showPokerActions = status === "in_progress" && mySeatIndex !== -1 && Boolean(myPlayerId);
  const [betAmount, setBetAmount] = useState(5);
  const [raiseAmount, setRaiseAmount] = useState(10);
  const currentBet = myBetState?.bet ?? 0;
  const projectedRaiseTotal = Math.min(100, currentBet + raiseAmount);

  const handlePokerAction = (action: PokerActionType, amount?: number) => {
    if (!myPlayerId) {
      return;
    }

    sendPokerAction({
      action,
      playerId: myPlayerId,
      amount,
      seatIndex: mySeatIndex === -1 ? undefined : mySeatIndex,
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === JOIN_KEY && canJoinFocusedSeat) {
        joinSeat(focusedSeatIndex!);
        event.preventDefault();
      }

      if (key === LEAVE_KEY && canLeaveSeat) {
        leaveSeat(mySeatIndex);
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canJoinFocusedSeat, focusedSeatIndex, joinSeat, canLeaveSeat, leaveSeat, mySeatIndex]);

  useEffect(() => {
    if (!actionFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActionFeedback(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [actionFeedback, setActionFeedback]);

  const shouldShowPanel =
    focusedSeatIndex !== null || mySeatIndex !== -1 || (isHost && status !== "in_progress");

  if (!shouldShowPanel) {
    return null;
  }

  const renderSeatInfo = () => {
    if (mySeatIndex !== -1) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-300">
            <Users size={16} />
            <span>คุณกำลังนั่งที่ Seat {mySeatIndex + 1}</span>
          </div>
          <p className="text-sm text-slate-300">
            กด <kbd className="px-1 py-0.5 bg-white/20 rounded">{LEAVE_KEY.toUpperCase()}</kbd> หรือใช้ปุ่มด้านล่างเพื่อออกจากที่นั่ง
          </p>
          <button
            onClick={() => leaveSeat(mySeatIndex)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> ออกจากที่นั่ง
          </button>
        </div>
      );
    }

    if (focusedSeatIndex !== null) {
      const occupantId = focusedSeat?.playerId ?? null;
      const occupantName = occupantId ? players.get(occupantId)?.username : null;

      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sky-300">
            <ChairIcon />
            <span>Seat {focusedSeatIndex + 1}</span>
          </div>
          <p className="text-sm text-slate-300">
            {occupantName
              ? `มีผู้เล่น ${occupantName} นั่งอยู่`
              : `กด ${JOIN_KEY.toUpperCase()} เพื่อจับจองที่นั่ง`}
          </p>
          <button
            onClick={() => joinSeat(focusedSeatIndex)}
            disabled={!canJoinFocusedSeat}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-slate-500/60 transition-colors text-sm font-medium"
          >
            <LogIn size={16} /> นั่งที่นี่ ({JOIN_KEY.toUpperCase()})
          </button>
        </div>
      );
    }

    return null;
  };

  const renderHostControls = () => {
    if (!isHost) {
      return null;
    }

    if (status === "starting") {
      return (
        <div className="flex items-center gap-2 text-amber-300">
          <Hand size={16} className="animate-pulse" />
          <span>กำลังเริ่มเกม...</span>
        </div>
      );
    }

    if (status === "in_progress") {
      return (
        <div className="flex items-center gap-2 text-emerald-300">
          <Crown size={16} />
          <span>เกมกำลังดำเนินอยู่</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 border-t border-white/10 pt-3 mt-3">
        <div className="flex items-center gap-2 text-white">
          <Crown size={16} />
          <span>Host Controls</span>
        </div>
        <p className="text-sm text-slate-300">
          {allSeatsFilled
            ? "พร้อมเริ่มเกมแล้ว"
            : "ต้องนั่งให้ครบทุกที่นั่งก่อนจึงจะเริ่มได้"}
        </p>
        <button
          onClick={requestTableStart}
          disabled={!allSeatsFilled || status !== "open"}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-slate-500/60 transition-colors text-sm font-medium"
        >
          <Play size={16} /> เริ่มเกม
        </button>
      </div>
    );
  };

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 shadow-xl rounded-xl px-6 py-4 min-w-[320px] max-w-sm text-white space-y-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-slate-300">
          <Users size={16} />
          <span>Caribbean Poker Table</span>
        </div>

        {renderSeatInfo()}

        {renderHostControls()}

        {showPokerActions && (
          <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
            <div className="text-xs uppercase tracking-wide text-slate-400">Actions ({pokerPhase.replace(/_/g, " ")})</div>
            <div className="grid gap-2 text-xs text-slate-200">
              <label className="flex flex-col gap-1">
                <span className="flex items-center justify-between">
                  <span>Bet Amount</span>
                  <span className="text-emerald-300">{betAmount}</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={betAmount}
                  onChange={(event) => setBetAmount(Number(event.target.value))}
                  className="accent-emerald-400"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="flex items-center justify-between">
                  <span>Raise Amount</span>
                  <span className="text-amber-300">{raiseAmount}</span>
                </span>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={raiseAmount}
                  onChange={(event) => setRaiseAmount(Number(event.target.value))}
                  className="accent-amber-400"
                />
              </label>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
              <p>
                เดิมพันปัจจุบัน: <span className="text-emerald-300">{currentBet}</span>
              </p>
              <p>
                หากกด <span className="font-semibold text-amber-300">Raise</span> จะเป็น
                <span className="ml-1 text-amber-200">{projectedRaiseTotal}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePokerAction("fold")}
                className="inline-flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 transition-colors px-3 py-2 text-sm"
              >
                หมอบ (Fold)
              </button>
              <button
                onClick={() => handlePokerAction("call")}
                className="inline-flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 transition-colors px-3 py-2 text-sm"
              >
                สู้ (Call)
              </button>
              <button
                onClick={() => handlePokerAction("bet", betAmount)}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors px-3 py-2 text-sm"
              >
                เดิมพัน {betAmount}
              </button>
              <button
                onClick={() => handlePokerAction("raise", raiseAmount)}
                className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors px-3 py-2 text-sm"
              >
                เกทับ {raiseAmount}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              การกดปุ่มเหล่านี้จะส่งข้อความ placeholder ไปยังเซิร์ฟเวอร์ Caribbean Poker
            </p>
            {actionFeedback && (
              <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-200">
                {actionFeedback}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChairIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M6 3v8m12-8v8M6 12h12M6 18v3m12-3v3M10 12v6m4-6v6" />
    </svg>
  );
}
