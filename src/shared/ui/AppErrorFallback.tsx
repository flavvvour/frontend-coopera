export function AppErrorFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <p style={{ fontSize: 18, fontWeight: 600 }}>Что-то пошло не так</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Перезагрузить</button>
    </div>
  )
}
