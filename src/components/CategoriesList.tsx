import React from "react";
import { useAppSelector } from "../store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

interface Category {
  _id: string;
  name: string;
  color?: string;
  total: number;
}

interface CategoriesListProps {
  categories: Category[];
}

const getCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
  const currency = useAppSelector((state) => state.user.user?.currency || "USD");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category._id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color || "#8884d8" }}
                ></div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {getCurrency(category.total, currency)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesList;