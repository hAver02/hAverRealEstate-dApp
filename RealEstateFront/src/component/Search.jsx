const Search = () => {
    return (
        <header className="bg-blue-950 h-52 w-full flex flex-col gap-4 justify-center items-center">
            <h2 className="text-2xl font-bold text-white text-center">Search it. Explore it. Buy it.</h2>
            <input
                type="text"
                className="w-1/2 py-2 rounded-xl text-center "
                placeholder="Enter an address, neighborhood, city, or ZIP code"
            />
        </header>
    );
}

export default Search;