const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || "Request failed");
  return response.json();
}
export const api = {
  summary: () => request("/dashboard/summary"),
  datasets: () => request("/datasets"),
  findings: () => request("/findings"),
  uploadDataset: (file) => { const body = new FormData(); body.append("file", file); return request("/datasets/upload", { method: "POST", body }); },
  runAudit: (id) => request(`/audit/run/${id}`, { method: "POST" }),
};
