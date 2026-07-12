import { useEffect } from 'react';

/**
 * ConfirmModal — A premium styled confirmation card to replace window.confirm().
 *
 * Props:
 *  - isOpen    {boolean}   Whether the modal is visible
 *  - onConfirm {function}  Called when user clicks the confirm button
 *  - onCancel  {function}  Called when user clicks Cancel or the backdrop
 *  - title     {string}    Modal heading
 *  - message   {string}    Supporting description
 *  - confirmLabel {string} Label for the confirm button (default: "Confirm")
 *  - icon      {string}    Material Symbol name (default: "logout")
 *  - danger    {boolean}   If true, the confirm button is red (default: true)
 */
const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  icon = 'logout',
  danger = true,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes cmFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cmSlideUp { from { opacity: 0; transform: translateY(18px) scale(.97); } to { opacity: 1; transform: none; } }

        .cm-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(241, 245, 249, 0.62);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          animation: cmFadeIn .18s ease;
          padding: 20px;
        }
        .cm-card {
          width: 100%; max-width: 400px;
          background: linear-gradient(180deg, #ffffff, #f8fafc);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          animation: cmSlideUp .22s cubic-bezier(.22,1,.36,1);
        }
        .cm-icon-wrap {
          width: 56px; height: 56px; border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .cm-icon-wrap.danger { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.22); }
        .cm-icon-wrap.danger span { color: #f87171; font-size: 26px; font-variation-settings: 'FILL' 1; }
        .cm-icon-wrap.neutral { background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.22); }
        .cm-icon-wrap.neutral span { color: #fbbf24; font-size: 26px; font-variation-settings: 'FILL' 1; }
        .cm-card h3 { margin: 0; color: #0f172a; font-size: 20px; font-weight: 900; }
        .cm-card p  { margin: 8px 0 0; color: #64748b; font-size: 14px; line-height: 1.55; }
        .cm-actions {
          display: flex; gap: 12px; margin-top: 28px;
        }
        .cm-btn {
          flex: 1; height: 44px; border: 0; border-radius: 14px;
          font-size: 14px; font-weight: 850; cursor: pointer;
          transition: transform .14s ease, box-shadow .14s ease, opacity .14s ease;
        }
        .cm-btn:hover { transform: translateY(-1px); }
        .cm-btn:active { transform: scale(.98); }
        .cm-cancel {
          background: #ffffff;
          border: 1px solid rgba(148,163,184,0.32);
          color: #475569;
        }
        .cm-cancel:hover { background: #f1f5f9; color: #0f172a; }
        .cm-confirm-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          box-shadow: 0 8px 24px rgba(239,68,68,0.22);
        }
        .cm-confirm-danger:hover { box-shadow: 0 12px 28px rgba(239,68,68,0.32); }
        .cm-confirm-neutral {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: #0f172a;
          box-shadow: 0 8px 24px rgba(245,158,11,0.20);
        }
        .cm-confirm-neutral:hover { box-shadow: 0 12px 28px rgba(245,158,11,0.28); }
      `}</style>

      {/* Backdrop */}
      <div className="cm-backdrop" onClick={onCancel}>
        {/* Card — stop propagation so clicking card doesn't close */}
        <div className="cm-card" onClick={(e) => e.stopPropagation()}>
          <div className={`cm-icon-wrap ${danger ? 'danger' : 'neutral'}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="cm-actions">
            <button className="cm-btn cm-cancel" onClick={onCancel}>Cancel</button>
            <button className={`cm-btn ${danger ? 'cm-confirm-danger' : 'cm-confirm-neutral'}`} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
