import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const showToast = useCallback((message, type = "info") => {
        const id = Date.now()
        setToasts((prev) => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 4000)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="toast-container position-fixed top-0 end-0 p-3">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast align-items-center text-white bg-${toastColor(t.type)} border-0 show`} role="alert">
                        <div className="d-flex">
                            <div className="toast-body">
                                {t.message}
                            </div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToasts((prev) => prev.filter(e => e.id !== t.id))}></button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function toastColor(type) {
    switch (type) {
        case "success": return "success";
        case "error": return "danger";
        case "warning": return "warning";
        default: return "primary";
    }
}

export const useToast = () => useContext(ToastContext)
