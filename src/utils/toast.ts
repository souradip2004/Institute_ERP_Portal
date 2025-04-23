import toast, { Toast, ToastOptions } from 'react-hot-toast';

const DEFAULT_DURATION = 3000;

interface NotifyOptions extends ToastOptions {
  id?: string;
}

export const notify = {
  /**
   * Show a success toast notification
   */
  success: (message: string, options?: NotifyOptions) => {
    return toast.success(message, {
      duration: DEFAULT_DURATION,
      ...options
    });
  },

  /**
   * Show an error toast notification
   */
  error: (message: string, options?: NotifyOptions) => {
    return toast.error(message, {
      duration: DEFAULT_DURATION * 1.5, // Error messages stay a bit longer
      ...options
    });
  },

  /**
   * Show a loading toast notification
   */
  loading: (message: string, options?: NotifyOptions) => {
    const id = options?.id || `loading-${Date.now()}`;
    return toast.loading(message, {
      id,
      duration: Infinity, // Loading toasts don't auto-dismiss
      ...options
    });
  },

  /**
   * Show an info toast notification
   */
  info: (message: string, options?: NotifyOptions) => {
    return toast(message, {
      duration: DEFAULT_DURATION,
      icon: '📝',
      ...options
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (message: string, options?: NotifyOptions) => {
    return toast(message, {
      duration: DEFAULT_DURATION,
      icon: '⚠️',
      style: {
        backgroundColor: '#FFFBEB',
        border: '1px solid #F59E0B',
      },
      ...options
    });
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string | Toast) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },

  /**
   * Show a promise toast that updates based on promise resolution/rejection
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      options
    );
  }
};

export default notify; 