import { chromium } from 'playwright'
const browser=await chromium.launch({headless:true})
const context=await browser.newContext({baseURL:'http://localhost:3001'})
await context.addInitScript(()=>{localStorage.setItem('3dlab_onboarded','true');localStorage.setItem('slatecamp-3dlab:onboarding:v1:global-complete','true');localStorage.setItem('slatecamp-viewport-onboarding-seen','true');localStorage.setItem('slatecamp-3dlab:onboarding:v1:viewport-tooltip-seen','true');localStorage.setItem('module_stairway-configurator_seen','true');localStorage.setItem('slatecamp-3dlab:onboarding:v1:module:stairway-configurator:seen','true')})
const page=await context.newPage()
await page.goto('/dashboard/3d-lab/stairway-configurator',{waitUntil:'domcontentloaded',timeout:60000})
await page.getByTestId('3dlab-shell-toolbar-overlay').getByTestId('3dlab-control-iso-se').waitFor({timeout:30000})
await page.waitForTimeout(2000)
console.log(await page.evaluate(() => {
 const canvas=document.querySelector('canvas')
 const keys=canvas?Object.keys(canvas):[]
 const fiberKey=keys.find(k=>k.startsWith('__reactFiber'))
 const propsKey=keys.find(k=>k.startsWith('__reactProps'))
 const fiber=fiberKey?canvas[fiberKey]:null
 const props=propsKey?canvas[propsKey]:null
 const seen=[]
 let n=fiber
 let i=0
 while(n&&i<20){seen.push({type: typeof n.type==='string'?n.type:(n.type?.name||n.elementType?.name||String(n.type)), key:n.key, tag:n.tag, memoizedProps:Object.keys(n.memoizedProps||{}).slice(0,10), stateNodeKeys:n.stateNode?Object.keys(n.stateNode).slice(0,20):null}); n=n.return; i++}
 return JSON.stringify({keys:keys.filter(k=>/react|r3f|fiber|three/i.test(k)), propsKeys:props?Object.keys(props).slice(0,20):null, seen}, null,2)
}))
await browser.close()
