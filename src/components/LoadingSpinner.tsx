import { useThemeStore } from '../store/themeStore';

export default function LoadingSpinner() {
  const { theme } = useThemeStore();

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '400px' }}
    >
      <div className="text-center">
        <div
          className="spinner"
          style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${theme.colors.border}`,
            borderTopColor: theme.colors.primary,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p
          style={{
            color: theme.colors.textSecondary,
            marginTop: '20px',
            fontWeight: 600,
          }}
        >
          Loading Pokemon...
        </p>
      </div>
    </div>
  );
}
