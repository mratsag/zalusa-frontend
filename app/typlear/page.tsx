"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function TypeLearPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchServiceTypes = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`${API}/api/pts-debug/service-types`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e0e0e0",
        fontFamily: "monospace",
        padding: "40px",
      }}
    >
      <h1 style={{ color: "#00e676", fontSize: "28px", marginBottom: "8px" }}>
        🔍 PTS Service Type Debug
      </h1>
      <p style={{ color: "#888", marginBottom: "24px" }}>
        PTS API&apos;den hesabınıza tanımlı aktif servis kodlarını sorgular.
      </p>

      <button
        onClick={fetchServiceTypes}
        disabled={loading}
        style={{
          background: loading ? "#333" : "#00e676",
          color: "#000",
          border: "none",
          padding: "12px 32px",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "24px",
        }}
      >
        {loading ? "⏳ Sorgulanıyor..." : "🚀 GET /get-service-type Çağır"}
      </button>

      {error && (
        <div
          style={{
            background: "#1a0000",
            border: "1px solid #ff1744",
            borderRadius: "8px",
            padding: "16px",
            color: "#ff5252",
            marginBottom: "16px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {data && (
        <div>
          <div
            style={{
              background: "#111",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "#888" }}>HTTP Status: </span>
            <span
              style={{
                color: data.http_status === 200 ? "#00e676" : "#ff5252",
                fontWeight: "bold",
              }}
            >
              {data.http_status}
            </span>
            {data.pts_base_url && (
              <span style={{ color: "#666", marginLeft: "16px" }}>
                | URL: {data.pts_base_url}
              </span>
            )}
            {data.pts_username && (
              <span style={{ color: "#666", marginLeft: "16px" }}>
                | User: {data.pts_username}
              </span>
            )}
          </div>

          {data.pts_response?.Services && (
            <div
              style={{
                background: "#0a1a0a",
                border: "1px solid #00e676",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ color: "#00e676", marginBottom: "12px" }}>
                ✅ Aktif Servis Kodları
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderBottom: "1px solid #333",
                        color: "#888",
                      }}
                    >
                      Servis Adı
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderBottom: "1px solid #333",
                        color: "#888",
                      }}
                    >
                      Servis Kodu
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderBottom: "1px solid #333",
                        color: "#888",
                      }}
                    >
                      Prefix
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.pts_response.Services.flat().map(
                    (svc: any, i: number) => (
                      <tr key={i}>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #222",
                            color: "#fff",
                            fontSize: "18px",
                          }}
                        >
                          {svc.service_name}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #222",
                            color: "#ffab00",
                            fontSize: "22px",
                            fontWeight: "bold",
                          }}
                        >
                          {svc.service_code}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #222",
                            color: "#90caf9",
                          }}
                        >
                          {svc.prefix}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          <details style={{ marginTop: "16px" }}>
            <summary
              style={{ color: "#888", cursor: "pointer", marginBottom: "8px" }}
            >
              📋 Raw JSON Yanıt
            </summary>
            <pre
              style={{
                background: "#111",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "16px",
                overflow: "auto",
                maxHeight: "400px",
                fontSize: "13px",
                color: "#ccc",
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
