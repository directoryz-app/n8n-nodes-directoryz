import {createHmac,timingSafeEqual} from 'crypto';
import type {IHookFunctions,INodeType,INodeTypeDescription,IWebhookFunctions,IWebhookResponseData,IHttpRequestMethods} from 'n8n-workflow';
import {NodeConnectionTypes,NodeOperationError} from 'n8n-workflow';
interface Hook {id:string;secret?:string;target?:string;url?:string;enabled?:boolean;status?:string}
async function api(ctx:IHookFunctions,method:IHttpRequestMethods,path:string,body?:object):Promise<{alerts?:Hook[];webhooks?:Hook[];alert?:Hook;webhook?:Hook;signing_secret?:string}> {
 try {const response=await ctx.helpers.httpRequestWithAuthentication.call(ctx,'directoryzOAuth2Api',{method,url:'https://mcp.directoryz.app'+path,json:true,disableFollowRedirect:true,timeout:30000,...(body?{body}:{})});return response;}
 catch {throw new NodeOperationError(ctx.getNode(),'Webhook registration failed. Check the connection, account permissions, plan, and selected resource.');}
}
export class DirectoryzTrigger implements INodeType {
 description:INodeTypeDescription={
  displayName:'Directoryz Trigger',name:'directoryzTrigger',icon:{light:'file:directoryz.svg',dark:'file:directoryz.svg'},group:['trigger'],version:1,subtitle:'Webhook events',description:'Receive signed Directoryz webhooks',defaults:{name:'Directoryz Trigger'},inputs:[],outputs:[NodeConnectionTypes.Main],credentials:[{name:'directoryzOAuth2Api',required:true}],
  webhooks:[{name:'default',httpMethod:'POST',responseMode:'onReceived',path:'directoryz-events'}],
  properties:[{displayName:'Activating this workflow registers a signed lead.created webhook. Deactivating removes only its own subscription. A public HTTPS n8n webhook URL, workspace admin role, and paid plan are required.',name:'setup',type:'notice',default:''}],
 };
 webhookMethods={default:{
  async checkExists(this:IHookFunctions):Promise<boolean> {
   const state=this.getWorkflowStaticData('node');if(!state.subscriptionId||!state.signingSecret)return false;
   const result=await api(this,'GET','/v1/webhooks');
   return Array.isArray(result.webhooks)&&result.webhooks.some((hook:Hook)=>hook.id===state.subscriptionId&&hook.url===this.getNodeWebhookUrl('default')&&hook.status==='active');
  },
  async create(this:IHookFunctions):Promise<boolean> {
   const url=this.getNodeWebhookUrl('default') as string;
   if(!url.startsWith('https://'))throw new NodeOperationError(this.getNode(),'Configure a public HTTPS webhook URL in n8n before activating this trigger.');
   const result=await api(this,'POST','/v1/webhooks',{url,description:'n8n workflow'});
   const hook=result.webhook;if(!hook?.id||!result.signing_secret)throw new NodeOperationError(this.getNode(),'The API did not return the subscription identifier and signing secret.');
   const state=this.getWorkflowStaticData('node');state.subscriptionId=hook.id;state.signingSecret=result.signing_secret;return true;
  },
  async delete(this:IHookFunctions):Promise<boolean> {
   const state=this.getWorkflowStaticData('node');if(!state.subscriptionId)return true;
   const prefix='/v1/webhooks';
   await api(this,'DELETE',prefix+'/'+encodeURIComponent(String(state.subscriptionId)));
   delete state.subscriptionId;delete state.signingSecret;delete state.resourceId;return true;
  },
 }};
 async webhook(this:IWebhookFunctions):Promise<IWebhookResponseData> {
  const req=this.getRequestObject(),res=this.getResponseObject();const state=this.getWorkflowStaticData('node');
  const reject=(status:number)=>{res.status(status).json({success:false});return {noWebhookResponse:true};};
  const signature=req.headers['x-directoryz-signature'];
  if(typeof signature!=='string'||!/^v1=[a-f0-9]{64}$/.test(signature)||typeof state.signingSecret!=='string')return reject(401);
  if(!Buffer.isBuffer(req.rawBody))await req.readRawBody();
  if(!Buffer.isBuffer(req.rawBody)||req.rawBody.length>262144)return reject(400);
  const timestamp=req.headers['x-directoryz-timestamp'];
  if(typeof timestamp!=='string'||!/^\d+$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300)return reject(401);
  const expected=createHmac('sha256',state.signingSecret).update(timestamp+'.').update(req.rawBody).digest();
  if(!timingSafeEqual(expected,Buffer.from(signature.slice(3),'hex')))return reject(401);
  let payload;try{payload=JSON.parse(req.rawBody.toString('utf8'));}catch{return reject(400);}
  if(payload.id!==req.headers['x-directoryz-event-id']||!['lead.created','webhook.test'].includes(payload.type))return reject(401);
  res.status(200).json({success:true});return {noWebhookResponse:true,workflowData:[this.helpers.returnJsonArray(payload)]};
 }
}
