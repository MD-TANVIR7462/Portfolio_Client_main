import toast from "react-hot-toast";

export const SuccessToast = (msg) => {
  toast.success(msg);
};

export const ErrorToast = (msg) => {
  toast.error(msg);
};
