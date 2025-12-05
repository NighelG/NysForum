import { useEffect } from "react";

const ToastContainer = ({ toasts }) => {
    useEffect(() => {
        if (window.bootstrap === undefined) return;
        toasts.forEach((toast) => {
            const toastEl = document.getElementById(`toast-${toast.id}`);
            if (toastEl) {
                const bsToast = new window.bootstrap.Toast(toastEl);
                bsToast.show();
            }
        });
    }, [toasts]);

    return (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
            {toasts.map((toast) => (
                <div key={toast.id} id={`toast-${toast.id}`} className={`toast text-bg-${toast.type} border-0`} role="alert">
                    <div className="toast-body">
                        {toast.message}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
