import React from 'react';

interface SideEffect {
  name: string;
  severity: string;
}

interface Retailer {
  name: string;
  url?: string;
}

interface DrugInfo {
  name: string;
  price: number;
  quantity: string;
  dosage: string;
  description: string;
  source: string;
  retailer?: Retailer;
  sideEffects?: SideEffect[];
  company?: string;
}

interface DrugCardProps {
  title: string;
  drug: DrugInfo;
}

const DrugCard: React.FC<DrugCardProps> = ({ title, drug }) => {
  return (
    <div className="w-80 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>
      <p className="text-xl font-bold mb-2">{drug.name}</p>
      
      {drug.company && (
        <p className="text-gray-600 mb-2">Company: {drug.company}</p>
      )}
      
      <p className="text-gray-600 mb-2">Price: ${drug.price.toFixed(2)}</p>
      <p className="text-gray-600 mb-2">Quantity: {drug.quantity}</p>
      <p className="text-gray-600 mb-2">Dosage: {drug.dosage}</p>
      
      {drug.description && (
        <p className="text-gray-600 mb-2">{drug.description}</p>
      )}
      
      {drug.retailer && (
        <p className="text-gray-600 mb-2">
          Available at: {drug.retailer.url ? (
            <a href={drug.retailer.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {drug.retailer.name}
            </a>
          ) : drug.retailer.name}
        </p>
      )}
      
      {drug.sideEffects && drug.sideEffects.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold mb-2 text-gray-700">Side Effects:</p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {drug.sideEffects.map((se, i) => (
              <li key={i} className="mb-1">
                {se.name} <span className="text-gray-500">({se.severity})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <p className="text-xs text-gray-400 mt-4">Source: {drug.source}</p>
    </div>
  );
};

export default DrugCard;
