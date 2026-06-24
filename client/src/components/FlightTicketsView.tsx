import { useState } from "react";
import { motion } from "framer-motion";
import { useFlightTickets } from "../lib/hooks/useFlightTickets";

export function FlightTicketsView() {
  const [city, setCity] = useState("London");
  const [newPrice, setNewPrice] = useState(799);
  const {
    prices,
    assistantResponse,
    loading,
    saving,
    error,
    askPrice,
    updatePrice,
  } = useFlightTickets();

  function handleAsk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    askPrice(city);
  }

  function handleUpdate() {
    updatePrice(city, newPrice);
  }

  return (
    <section className="mt-16 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-5 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
            Airline tools
          </p>

          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            FlightAI Tickets
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            A TypeScript version of the notebook flow: the backend calls a
            ticket-price tool backed by a SQLite prices table.
          </p>

          <form onSubmit={handleAsk} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Destination city
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-normal outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-300/20"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                New price
                <input
                  type="number"
                  min={0}
                  value={newPrice}
                  onChange={(event) => setNewPrice(Number(event.target.value))}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-normal outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-300/20"
                />
              </label>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="min-h-11 self-end rounded-full border border-sky-200 bg-sky-50 px-5 text-sm font-bold text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {saving ? "Saving..." : "Set price"}
              </button>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="min-h-11 rounded-full bg-sky-700 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(3,105,161,0.24)] transition hover:-translate-y-0.5 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? "Calling tool..." : "Get ticket price"}
            </button>
          </form>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-inner sm:p-5">
            {!assistantResponse ? (
              <div className="flex min-h-48 items-center justify-center text-center text-sm leading-6 text-slate-400">
                Ask for a city to see the backend tool call and answer.
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                    Assistant answer
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">
                    {assistantResponse.answer}
                  </p>
                </div>

                <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <h3 className="text-base font-black text-white">
                    {assistantResponse.toolCall.toolName}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {assistantResponse.toolCall.description}
                  </p>
                  <pre className="mt-3 max-h-44 overflow-auto rounded-xl bg-black/30 p-3 text-xs leading-5 text-sky-100">
                    {JSON.stringify(assistantResponse.toolCall, null, 2)}
                  </pre>
                </article>
              </motion.div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-4 shadow-inner sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              SQLite prices
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {prices.map((ticketPrice) => (
                <div
                  key={ticketPrice.city}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                >
                  <span className="text-sm font-bold capitalize text-slate-700">
                    {ticketPrice.city}
                  </span>
                  <span className="text-sm font-black text-sky-700">
                    ${ticketPrice.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
