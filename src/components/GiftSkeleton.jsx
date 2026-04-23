export default function GiftSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden flex flex-col h-full animate-pulse">
      {/* Imagem Placeholder */}
      <div className="w-full aspect-[4/3] bg-gray-200"></div>
      
      <div className="p-6 flex flex-col flex-grow">
        {/* Título Placeholder */}
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-2"></div>
        
        <div className="flex-grow"></div>
        
        {/* Preço Placeholder */}
        <div className="h-7 bg-gray-200 rounded-md w-1/3 mb-5 mt-4"></div>
        
        {/* Botão Placeholder */}
        <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}
