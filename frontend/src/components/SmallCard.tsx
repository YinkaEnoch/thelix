type Props = { title: string; content: string | number };

export const SmallCard = (props: Props) => {
  return (
    <div className="inline-block w-40 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <p className="font-normal text-gray-600 dark:text-gray-400">
        {props.title}
      </p>

      <h5 className="text-2xl  font-bold tracking-tight text-gray-900 dark:text-white">
        {props.content}
      </h5>
    </div>
  );
};
