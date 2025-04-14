import React, { useState } from "react";

const InputForm = ({ onSubmit }) => {
  const [code, setCode] = useState("");

  const handleChange = (event) => {
    setCode(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex items-center gap-6 mb-4'>
      <input
        type='text'
        placeholder='Enter Bus Stop Code'
        className='flex items-center appearance-none w-full border-4 border-accent-1 rounded py-2 px-3 text-gray-700 leading-tight focus:border-transparent focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out'
        value={code}
        onChange={handleChange}
      />
      <button
        type='submit'
        className='bg-accent-2 hover:opacity-80 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline uppercase cursor-pointer transition-opacity duration-300 ease-in-out'
      >
        Go
      </button>
    </form>
  );
};

export default InputForm;
