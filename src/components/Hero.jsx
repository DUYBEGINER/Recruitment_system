import React, { useState } from "react";
import { Briefcase, MapPin, Search } from "lucide-react";

export default function Hero({
  background =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1920&auto=format&fit=crop",
  onSearch,
}) {
  const [job, setJob] = useState("");
  const [region, setRegion] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSearch?.({ job, region });
  };

  return (
    <section className="relative h-[56vh] md:h-[68vh] w-full overflow-hidden rounded-none md:rounded-2xl">
      {/* Background image */}
      <img
        src={background}
        alt="hero"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 h-full mx-auto max-w-6xl px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md">
          Vươn lên cùng thử thách
        </h1>

        {/* Search Bar */}
        <form
          onSubmit={submit}
          className="mt-8 w-full max-w-5xl rounded-full bg-white/95 shadow-xl ring-1 ring-slate-200 backdrop-blur-md"
        >
          <div className="flex items-center py-2">
            {/* Job */}
            <div className="flex items-center gap-2 pl-5 pr-3 py-3 flex-1">
              <span className="text-red-600 font-semibold hidden sm:block w-24">
                Công việc:
              </span>
              <Briefcase size={18} className="text-slate-500 sm:hidden" />
              <input
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="Tìm theo tên hoặc kỹ năng"
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Divider dot (giống UI mẫu) */}
            <div className="hidden sm:flex items-center px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Region */}
            <div className="flex items-center gap-2 px-3 py-3 flex-1">
              <span className="text-slate-700 font-semibold hidden sm:block w-24">
                Khu vực:
              </span>
              <MapPin size={18} className="text-slate-500 sm:hidden" />
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Tìm theo khu vực"
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group ml-auto mr-1 my-1 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition"
              aria-label="Tìm kiếm"
            >
              <Search size={18} />
              <span className="hidden sm:block">Tìm kiếm</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
