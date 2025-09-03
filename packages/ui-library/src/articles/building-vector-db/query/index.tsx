import { clsx } from 'clsx'
import { Dispatch, SetStateAction, useState } from 'react'

const data = [
  {
    query: 'domestic pet',
    results: [
      {
        doc: 'The cat is sleeping on the chair.',
        euclidean: 8.82295227050781,
        cosine: 0.36733609437942505,
      },
      {
        doc: 'A river flows through the valley...',
        euclidean: 12.136998176574707,
        cosine: 0.06201300770044327,
      },
      {
        doc: 'She loves playing the piano!',
        euclidean: 11.284441947937012,
        cosine: 0.14509940147399902,
      },
      {
        doc: 'Paris is the capital city of France.',
        euclidean: 10.82635498046875,
        cosine: 0.16355328261852264,
      },
      {
        doc: 'The spacecraft landed safely on the moon!',
        euclidean: 10.356178283691406,
        cosine: 0.18387603759765625,
      },
    ],
  },
  {
    query: 'flying',
    results: [
      {
        doc: 'The cat is sleeping on the chair.',
        euclidean: 13.307869911193848,
        cosine: 0.25575801730155945,
      },
      {
        doc: 'A river flows through the valley...',
        euclidean: 15.299195289611816,
        cosine: 0.10691634565591812,
      },
      {
        doc: 'She loves playing the piano!',
        euclidean: 14.362504959106445,
        cosine: 0.1969681829214096,
      },
      {
        doc: 'Paris is the capital city of France.',
        euclidean: 15.20421314239502,
        cosine: 0.05554698407649994,
      },
      {
        doc: 'The spacecraft landed safely on the moon!',
        euclidean: 11.541861534118652,
        cosine: 0.4947282373905182,
      },
    ],
  },
  {
    query: 'water',
    results: [
      {
        doc: 'The cat is sleeping on the chair.',
        euclidean: 16.637733459472656,
        cosine: 0.3202410042285919,
      },
      {
        doc: 'A river flows through the valley...',
        euclidean: 14.294898986816406,
        cosine: 0.578090250492096,
      },
      {
        doc: 'She loves playing the piano!',
        euclidean: 18.84019660949707,
        cosine: 0.09279763698577881,
      },
      {
        doc: 'Paris is the capital city of France.',
        euclidean: 17.30800437927246,
        cosine: 0.25896018743515015,
      },
      {
        doc: 'The spacecraft landed safely on the moon!',
        euclidean: 16.45337677001953,
        cosine: 0.35118529200553894,
      },
    ],
  },
  {
    query: 'I would like to learn music',
    results: [
      {
        doc: 'The cat is sleeping on the chair.',
        euclidean: 10.600587844848633,
        cosine: 0.32888883352279663,
      },
      {
        doc: 'A river flows through the valley...',
        euclidean: 11.549695014953613,
        cosine: 0.32457491755485535,
      },
      {
        doc: 'She loves playing the piano!',
        euclidean: 10.246354103088379,
        cosine: 0.45050695538520813,
      },
      {
        doc: 'Paris is the capital city of France.',
        euclidean: 11.989473342895508,
        cosine: 0.20643950998783112,
      },
      {
        doc: 'The spacecraft landed safely on the moon!',
        euclidean: 10.758503913879395,
        cosine: 0.3385370671749115,
      },
    ],
  },
  {
    query: 'European metropolis',
    results: [
      {
        doc: 'The cat is sleeping on the chair.',
        euclidean: 9.843750953674316,
        cosine: 0.196247860789299,
      },
      {
        doc: 'A river flows through the valley...',
        euclidean: 11.335068702697754,
        cosine: 0.1728910505771637,
      },
      {
        doc: 'She loves playing the piano!',
        euclidean: 11.864912986755371,
        cosine: 0.04295751824975014,
      },
      {
        doc: 'Paris is the capital city of France.',
        euclidean: 8.665029525756836,
        cosine: 0.45703449845314026,
      },
      {
        doc: 'The spacecraft landed safely on the moon!',
        euclidean: 10.002583503723145,
        cosine: 0.22777868807315826,
      },
    ],
  },
]

type QuerySelectProps = {
  index: number
  setIndex: Dispatch<SetStateAction<number>>
}

function QuerySelect({ setIndex, index }: QuerySelectProps) {
  const options = data.map((query, idx) => ({
    value: idx,
    label: query.query,
  }))

  return (
    <form className="mx-auto max-w-sm">
      <select
        value={index}
        onChange={(e) => {
          setIndex(Number(e.target.value))
        }}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      >
        {options.map(({ value, label }) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  )
}

function Query() {
  const [index, setIndex] = useState(0)

  return (
    <div className="article-component-container">
      <div className="mb-12">
        <p className="mt-0! mb-2! text-center text-sm font-semibold">Query:</p>
        <div className="mx-auto max-w-sm text-sm">
          <QuerySelect setIndex={setIndex} index={index} />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center text-xs">
          <span className="w-6/12">Document</span>
          <span className="w-2/12 px-3 text-center">Eucliden Distance</span>
          <span className="w-2/12 px-3 text-center">Cosine Similarity</span>
          <span className="w-2/12 px-3 text-center">Similarity</span>
        </div>
        {data[index].results.map((res) => (
          <div className="flex items-center px-2 text-sm" key={res.doc}>
            <span className="w-6/12">{res.doc}</span>
            <span className="w-2/12 text-center">
              {res.euclidean.toFixed(3)}
            </span>
            <span className="w-2/12 text-center">{res.cosine.toFixed(3)}</span>
            <div className="bg-text/10 h-3 w-2/12 overflow-hidden rounded-full">
              <div
                className={clsx('bg-text/50 h-full rounded-full', {
                  'bg-green-400!':
                    res.cosine ===
                    Math.max(...data[index].results.map((res) => res.cosine)),
                })}
                style={{
                  width: `${(res.cosine / Math.max(...data[index].results.map((res) => res.cosine))) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Query
