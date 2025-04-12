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
}

interface DrugCardProps {
  title: string;
  drug: DrugInfo;
}

const DrugCard: React.FC<DrugCardProps> = ({ title, drug }) => {
  return (
    <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-xl font-bold mb-2">{drug.name}</p>
      <p className="text-gray-600 mb-2">Price: ${drug.price.toFixed(2)}</p>
      <p className="text-gray-600 mb-2">Quantity: {drug.quantity}</p>
      <p className="text-gray-600 mb-2">Dosage: {drug.dosage}</p>
      {drug.description && (
        <p className="text-gray-600 mb-2">{drug.description}</p>
      )}
      {drug.retailer && (
        <p className="text-gray-600 mb-2">
          Retailer: {drug.retailer.url ? (
            <a href={drug.retailer.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {drug.retailer.name}
            </a>
          ) : drug.retailer.name}
        </p>
      )}
      {drug.sideEffects && drug.sideEffects.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold mb-1">Side Effects:</p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {drug.sideEffects.map((se, i) => (
              <li key={i}>{se.name} ({se.severity})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DrugCard;
