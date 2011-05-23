using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using IT_Cint.Models;
using System.Net;
using System.Web.UI;
using System.IO;
using System.Globalization;


namespace IT_Cint.Controllers
{
    [OutputCache(Location = OutputCacheLocation.None)]
    public class LiveRespondentsController : Controller
    {
       private LiveRespondentsModel liveRespondentsRepo;
       private CountryCount country;

       public LiveRespondentsController()
        {
            liveRespondentsRepo = new LiveRespondentsModel();
            country = new CountryCount();
        }

        public ActionResult Index()
       {
           return View("Index");

       }


        public JsonResult getLiveRespondents()
        {
            return Json(liveRespondentsRepo.showLiveRespondents(), JsonRequestBehavior.AllowGet);
            
        }


        public JsonResult getCountryCount() {
            return Json(country.getRespondentsByCountry(), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public void CreateResp(LiveRespondent liveRespondent)
        {
            liveRespondentsRepo.saveDataFromCpx(liveRespondent);

        }

    }
}
