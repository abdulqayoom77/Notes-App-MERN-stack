const EmptyCard = ({ onAddNote }) => {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="bg-white shadow-lg rounded-lg max-w-sm p-6 flex flex-col items-center text-center">
        <div
          onClick={onAddNote}
          className="w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full mb-4 cursor-pointer hover:bg-blue-200 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10 text-blue-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.75v14.5m-7.5-7.5h15"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          No Notes Available
        </h2>
        <p className="text-gray-500 text-sm">
          Click the <strong>+</strong> button to add your first note.
        </p>
      </div>
    </div>
  );
};

export default EmptyCard;
