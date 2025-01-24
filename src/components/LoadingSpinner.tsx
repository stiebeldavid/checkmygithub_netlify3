const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;