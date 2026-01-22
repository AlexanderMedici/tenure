import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { authApi } from "./api";

const AuthContext = createContext({
  user: null,
  loading: true,
  refresh: async () => {},
});

const normalizeUser = (data) => {
  if (!data) return null;
  return data?.data?.user || data.user || data;
};

export const getHomeForRole = (role) => {
  if (role === "management") return "/mgmt";
  if (role === "admin") return "/mgmt";
  return "/dashboard";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await authApi.me();
      setUser(normalizeUser(data));
    } catch (_err) {
      setUser(null);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await refresh();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const scope = useMemo(() => {
    if (!user) return null;
    return {
      role: user.role,
      buildingId: user.buildingId,
      buildingIds: user.buildingIds || [],
      unitId: user.unitId,
      leaseId: user.leaseId,
    };
  }, [user]);

  const value = useMemo(
    () => ({ user, scope, loading, refresh }),
    [user, scope, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }

  return children;
};
