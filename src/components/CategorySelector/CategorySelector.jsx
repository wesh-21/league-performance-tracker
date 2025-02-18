import React from 'react';

const CategorySelector = ({
  selectedCategory,
  setSelectedCategory,
  isOpen,
  setIsOpen,
  categories
}) => {
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsOpen(false);
  };

  // Filter out the currently selected category
  const availableCategories = categories.filter(category => category !== selectedCategory);

  return (
<div className="max-w-2xl mx-auto pt-2">
  <div className="relative flex flex-col items-center">
    {/* Main selected category button */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="font-[Fondamento-Regular] w-[92px] h-[32px] bg-gray-200 text-gray-800 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 hover:bg-gray-300"
    >
      {selectedCategory}
    </button>

    {/* Dropdown menu with transitions */}
    <div
      className={`absolute top-full  mt-6 flex flex-col items-center gap-4 max-w-[100vw] transition-all duration-300 mx-[10px] ${
        isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      {/* First row (3 buttons, one centered, others 24px apart) */}
      <div className="flex justify-center gap-[24px]">
        <button
          onClick={() => handleCategoryClick(availableCategories[0])}
          className="w-[70px] h-[25px] bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition-all duration-300 focus:outline-none font-[Fondamento-Regular] text-[11px] overflow-hidden text-ellipsis"
        >
          {availableCategories[0]}
        </button>
        <button
          onClick={() => handleCategoryClick(availableCategories[1])}
          className="w-[70px] h-[25px] bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition-all duration-300 focus:outline-none font-[Fondamento-Regular] text-[11px] overflow-hidden text-ellipsis"
        >
          {availableCategories[1]}
        </button>
        <button
          onClick={() => handleCategoryClick(availableCategories[2])}
          className="w-[70px] h-[25px] bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition-all duration-300 focus:outline-none font-[Fondamento-Regular] text-[11px] overflow-hidden text-ellipsis"
        >
          {availableCategories[2]}
        </button>
      </div>

      {/* Second row (2 buttons, 14px left and right of the center) */}
      <div className="flex justify-center gap-[28px]">
        <button
          onClick={() => handleCategoryClick(availableCategories[3])}
          className="w-[70px] h-[25px] bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition-all duration-300 focus:outline-none font-[Fondamento-Regular] text-[11px] overflow-hidden text-ellipsis"
        >
          {availableCategories[3]}
        </button>
        <button
          onClick={() => handleCategoryClick(availableCategories[4])}
          className="w-[70px] h-[25px] bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition-all duration-300 focus:outline-none font-[Fondamento-Regular] text-[11px] overflow-hidden text-ellipsis"
        >
          {availableCategories[4]}
        </button>
      </div>
    </div>
  </div>
</div>






  );
};

export default CategorySelector;