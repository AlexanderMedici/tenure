import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../app/auth";
import SectionHeader from "../../components/SectionHeader";
import { apiFetch, withBuildingId } from "../../app/api";
import CardRow from "../../components/CardRow";
import StatusPill from "../../components/StatusPill";

export default function ResidentProfile() {
  const { user, refresh, scope } = useAuth();
  const [file, setFile] = useState(null);
  const [bio, setBio] = useState(user?.bio || "");
  const [uploadState, setUploadState] = useState({
    loading: false,
    error: null,
    success: null,
  });
  const [bioState, setBioState] = useState({
    loading: false,
    error: null,
    success: null,
  });
  const [requestsState, setRequestsState] = useState({
    loading: true,
    error: null,
    data: [],
  });

  const initials = (user?.name || "Resident")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    setBio(user?.bio || "");
  }, [user?.bio]);

  useEffect(() => {
    let active = true;
    apiFetch(withBuildingId("/api/tickets", scope?.buildingId))
      .then((data) => {
        if (active) {
          setRequestsState({
            loading: false,
            error: null,
            data: data.data,
          });
        }
      })
      .catch((err) => {
        if (active) {
          setRequestsState({ loading: false, error: err.message, data: [] });
        }
      });
    return () => {
      active = false;
    };
  }, [scope?.buildingId]);

  const fileInputRef = useRef(null);

  const uploadPhoto = async (selectedFile) => {
    if (!selectedFile) {
      setUploadState({
        loading: false,
        error: "Select an image to upload.",
        success: null,
      });
      return;
    }

    setUploadState({ loading: true, error: null, success: null });
    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);
      const res = await fetch(
        withBuildingId("/api/users/me/photo", scope?.buildingId),
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json()
        : {};

      if (!res.ok) {
        throw new Error(payload?.message || "Upload failed");
      }

      setUploadState({
        loading: false,
        error: null,
        success: "Profile photo updated.",
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await refresh();
    } catch (err) {
      setUploadState({
        loading: false,
        error: err.message || "Upload failed",
        success: null,
      });
    }
  };

  const handleBioSave = async (event) => {
    event.preventDefault();
    setBioState({ loading: true, error: null, success: null });
    try {
      const res = await fetch(withBuildingId("/api/users/me", scope?.buildingId), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });

      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json()
        : {};

      if (!res.ok) {
        throw new Error(payload?.message || "Save failed");
      }

      setBioState({ loading: false, error: null, success: "Bio updated." });
      await refresh();
    } catch (err) {
      setBioState({
        loading: false,
        error: err.message || "Save failed",
        success: null,
      });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Profile"
        subtitle="Manage your contact and notification settings."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="flex items-center gap-4">
          {user?.profilePhoto?.url ? (
            <img
              src={user.profilePhoto.url}
              alt="Profile"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-500">
              {initials}
            </div>
          )}
          <form className="space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Profile photo
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                setFile(selected);
                uploadPhoto(selected);
              }}
            />
            {uploadState.error ? (
              <div className="text-xs text-rose-600">{uploadState.error}</div>
            ) : uploadState.success ? (
              <div className="text-xs text-emerald-700">
                {uploadState.success}
              </div>
            ) : null}
            <button
              type="button"
              disabled={uploadState.loading}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs text-white disabled:opacity-60"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                  fileInputRef.current.click();
                }
              }}
            >
              {uploadState.loading ? "Uploading…" : "Upload photo"}
            </button>
          </form>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Account
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div>
              <span className="text-slate-500">Name</span>
              <div className="text-slate-900">{user?.name || "Resident"}</div>
            </div>
            <div>
              <span className="text-slate-500">Email</span>
              <div className="text-slate-900">{user?.email || "-"}</div>
            </div>
            <div>
              <span className="text-slate-500">Role</span>
              <div className="text-slate-900">{user?.role || "-"}</div>
            </div>
          </div>
        </div>
        <form onSubmit={handleBioSave} className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Bio
          </div>
          <textarea
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself..."
          />
          {bioState.error ? (
            <div className="text-xs text-rose-600">{bioState.error}</div>
          ) : bioState.success ? (
            <div className="text-xs text-emerald-700">{bioState.success}</div>
          ) : null}
          <button
            type="submit"
            disabled={bioState.loading}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs text-white disabled:opacity-60"
          >
            {bioState.loading ? "Saving…" : "Save bio"}
          </button>
        </form>
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Previous requests
          </div>
          {requestsState.loading ? (
            <div className="text-sm text-slate-500">Loading requests…</div>
          ) : requestsState.error ? (
            <div className="text-sm text-rose-600">{requestsState.error}</div>
          ) : requestsState.data.length ? (
            <div className="space-y-3">
              {requestsState.data.map((ticket) => (
                <CardRow
                  key={ticket._id}
                  meta={new Date(ticket.createdAt).toLocaleDateString()}
                  title={ticket.title}
                  subtitle={ticket.description || "No description provided."}
                  status={<StatusPill status={ticket.status} />}
                  right={
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {ticket.priority}
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              No previous requests yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
