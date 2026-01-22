import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-24">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
          TENURE
        </div>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          Building operations, clarified.
        </h1>
        <p className="max-w-xl text-base text-slate-300">
          This is a protected app. Sign in to continue and we’ll route you to
          your resident or management workspace.
        </p>
        <Button
          className="bg-white text-slate-950 hover:bg-slate-100"
          onClick={() => navigate("/login")}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
