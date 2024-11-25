export function ErrorMessage({ message }: { message: string }) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-lg mb-4">出错了！</div>
        <div className="text-gray-600">{message}</div>
      </div>
    )
  }