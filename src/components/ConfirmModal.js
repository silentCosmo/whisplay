// components/ConfirmModal.jsx
"use client";

export default function ConfirmModal({ title, message, onConfirm, onCancel, style }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-sm w-full shadow-lg text-center" style={style}>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-neutral-300 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-black/40 rounded hover:bg-neutral-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
