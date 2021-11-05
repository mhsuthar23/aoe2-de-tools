import { placeholder } from '/js/placeholder.js'
import { finder, setUpGatherRates } from '/js/shared-es.js'

// TODO remove
init().then(main)

// Generates String html collection
// example:
// <div id="1"> </div>
// <div id="2"> </div>
// <div id="3"> </div>
// makeHtmlCollection :: String -> Array -> returns String
const makeHtmlCollection = (templateItem) => (arr) => {
  return (
    arr
      // this needs to be mapped into src of the image,
      // otherwise image in template with src is trying to load the src resulting in 404,
      // therefore we are adding src="img path" later
      .map((it) => ({ ...it, src: `src="/img/${it.name}.png"` }))
      .map((it) => {
        return placeholder(templateItem.outerHTML)(it)
      })
      .reduce((curr, next) => {
        return `${curr}
${next}`
      }, '')
  )
}

// hides or shows element
// toggle :: Element
const toggle = (it) => {
  // https://github.com/nefe/You-Dont-Need-jQuery#8.2
  if (
    it.ownerDocument.defaultView.getComputedStyle(it, null).display === 'none'
  ) {
    it.style.display = 'block'
  } else {
    it.style.display = 'none'
  }
}

// appendResourceType :: Element
const appendResourceType = (box) => {
  const tResRow = document.getElementById('t-res-row')
  const tResItem = document.getElementById('t-res-row-resource')

  const rResRow = tResRow.content.firstElementChild.cloneNode(true)
  const rResItem = tResItem.content.firstElementChild.cloneNode(true)

  rResRow.innerHTML = makeHtmlCollection(rResItem)([
    { name: 'farmer', value: 1 },
    { name: 'farmer', value: 1 },
  ])

  box.appendChild(rResRow)
}

const getHiddenRes = () => {
  const chres = Array.from(
    document.querySelectorAll('#choose-res > .res-show-img >.showing-img')
  ).map((it) => it.getAttribute('resource'))
}

const calculateVilTotals = () => {
  let unitsBeingCreated = {}
  let vilsReq = {}
  //Get all visible unit conatiners.
  Array.from(
    document.querySelectorAll('#gather-rates > .unit-container:visible')
  ).map((it) => {
    const unitName = it
      .querySelector('.unit > .unit-class > img')
      .getAttribute('title')
    console.log({ unitName })
    unitsBeingCreated[unitName] = {}
    Array.from(it.querySelectorAll('.unit > .res-cont')).map((cont) => {
      const res = cont.getAttribute('title')
      unitsBeingCreated[unitName][res] = parseInt(
        cont.querySelector('div').innerText
      )
    })
    unitsBeingCreated[unitName].quantity = parseInt(
      it.querySelector('.unit > .multiplier-cont > div:eq(1)').innerText
    )
    Array.from(
      it.querySelectorAll(
        '.res-desc-cont > .resources-cont > .res-row > .resource'
      )
    ).map((cont) => {
      const resName = cont.querySelector('.icon-big').getAttribute('title')
      const resVal = parseFloat(
        cont.querySelector('.resource-num').getAttribute('title')
      )
      vilsReq[resName] = vilsReq[resName] ? vilsReq[resName] + resVal : resVal
    })
  })

  const resTotals = new DOMParser().parseFromString(
    "<div class='res-totals'></div>",
    'text/html'
  )
  const resDisplay = new DOMParser().parseFromString(
    "<div class='resources-cont'></div>",
    'text/html'
  )
  const unitsDisplay = new DOMParser().parseFromString(
    "<div class='unit-totals'></div>",
    'text/html'
  )

  const hiddenRes = getHiddenRes()

  let resRow, curRes
  for (let i in vilsReq) {
    let res = gatherRates[i].res
    if (curRes !== res) {
      if (resRow) {
        resDisplay.appendChild(resRow)
      }
      curRes = res

      resRow = new DOMParser().parseFromString(
        "<div class='res-row'></div>",
        'text/html'
      )
    }
    let resElm = new DOMParser().parseFromString(`
      <div class='resource' resource='${i}'>
        <img class='icon-big' src='/img/${i}.png' title='${i}'>
        <div class='resource-num' title='${vilsReq[i]}'>
          <div>${Math.ceil(vilsReq[i])}'</div>
        </div>
      </div>'", 'text/html'`)
    resRow.appendChild(resElm)
    if (hiddenRes.includes(i)) {
      resElm.style.display = 'none'
    }
  }
  resDisplay.appendChild(resRow)

  for (let i in unitsBeingCreated) {
    unitsDisplay.appendChild(
      "<div class='unit-class'><div class='resource-num' title='" +
        unitsBeingCreated[i].quantity +
        "'><div>" +
        Math.ceil(unitsBeingCreated[i].quantity) +
        "</div></div><img src='/img/" +
        i +
        ".png' title='" +
        i +
        "'></div>"
    )
  }

  resTotals.appendChild(resDisplay)
  resTotals.appendChild(unitsDisplay)
  document.querySelector('#vil-totals > .res-totals').innerHTML = resTotals
}

const resClickEventHandlers = (event) => {
  if (!event.target.closest('[resource]')) return
  event.preventDefault()

  const el = event.target.closest('[resource]')
  el.classList.toggle('showing-img')
  const res = el.getAttribute('resource')
  Array.from(
    document.querySelectorAll(
      `#gather-rates > .unit-container > [resource="${res}"]`
    )
  ).map((it) => {
    console.log(it)
    toggle(it)
  })

  // calculateVilTotals()
}

const unitClickEventHandlers = (event) => {
  if (!event.target.closest('[unit]')) return
  event.preventDefault()

  const el = event.target.closest('[unit]')
  el.classList.toggle('showing-img')
  const res = el.getAttribute('unit')

  const box = document.getElementById('resources-cont-box')

  // TODO check if the resources are already present
  appendResourceType(box)

  // this is triggered by calculate vills call function
  // This takes care of adding row for resource when unit depends on it. // toggles display none or ""
  // let res = gatherRates[i].res
  // if (curRes !== res) {
  //   if (resRow) resDisplay.append(resRow)
  //   curRes = res
  //   resRow = $("<div class='res-row'></div>")
  // }
  // let resElm = $(
  //   "<div class='resource' resource='" +
  //     i +
  //     "'><img class='icon-big' src='/img/" +
  //     i +
  //     ".png' title='" +
  //     i +
  //     "'><div class='resource-num' title='" +
  //     vilsReq[i] +
  //     "'><div>" +
  //     Math.ceil(vilsReq[i]) +
  //     '</div></div></div>'
  // )
  // resRow.append(resElm)
  // if (hiddenRes.includes(i)) {
  //   $(resElm).hide()
  // }
  //
  //
  //
}

async function init() {
  const data = await fetch('/data.json') // this takes 500ms on localhost
    .then((response) => response.json())
  // load data and generate gatherRates
  const gatherRates = setUpGatherRates(data) // this takes 1ms
  console.log(gatherRates)
  return gatherRates
}

async function main(gatherRates) {
  document.addEventListener(
    'click',
    function (event) {
      // TODO event on change of the select option
      // TODO event on change of the checkbox
      //
      // TODO event on click for units

      resClickEventHandlers(event)
      unitClickEventHandlers(event)
    },
    false
  )
  // const test = document.getElementById('t-test').innerHTML
  // console.log(test)

  // document.getElementById('t-box').innerHTML = placeholder(test)({test: 'works'})

  // <template id="t-test">
  //   <p>[[test]]</p>
  // </template>
  // <div id="t-box"></div>
}
