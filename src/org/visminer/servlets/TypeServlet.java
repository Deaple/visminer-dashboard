package org.visminer.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.bson.Document;
import org.json.JSONArray;
import org.repositoryminer.persistence.handler.CommitAnalysisDocumentHandler;

@WebServlet("/TypeServlet")
public class TypeServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private CommitAnalysisDocumentHandler typeHandler = new CommitAnalysisDocumentHandler();
	private PrintWriter out;
       
    public TypeServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("application/json");
		out = response.getWriter();				
		String action = request.getParameter("action");
		
		switch (action) {
			case "getAllByTree":
				getAllByTree(request.getParameter("treeId"));	
				break;
			case "confirmSingleDebt":
				updateDebtStatus(request.getParameter("commitId"), 
						request.getParameter("fileId"), request.getParameter("debt"), 1);	
				break;
			case "removeSingleDebt":
				updateDebtStatus(request.getParameter("commitId"), 
						request.getParameter("fileId"), request.getParameter("debt"), 0);	
				break;
			case "confirmAllDebtsByTag":
				confirmAllDebtsByTag(request.getParameter("treeId"));	
				break;
			case "confirmAllDebtsByRepository":
				confirmAllDebtsByRepository(request.getParameter("repositoryId"));	
				break;
			case "getListOfTypesByListOfTags":
				getListOfTypesByListOfTags(request.getParameter("ids"));
				break;
			case "updateDebtStatus":
				String status = request.getParameter("status");
				if (status != null) {
					updateDebtStatus(request.getParameter("commitId")
							, request.getParameter("fileId")
							, request.getParameter("debt")
							, Integer.parseInt(status));
				}	
				break;	
			case "getTypeTimeline":
				getTypeTimeline(request.getParameter("idRepository"), request.getParameter("fileHash"));
			default:
				break;
		}
	}

	private void getAllByTree(String treeId) {
		List<String> typeList = new ArrayList<>();
		typeHandler.getAllByTree(treeId)
			.forEach(type->typeList.add(type.toJson()));
		out.println(typeList);
	}
	
	private void getListOfTypesByListOfTags(String tagsId) {
		JSONArray array = new JSONArray(tagsId);
		List<ArrayList<String>> typeLists = new ArrayList<>();
		for (Object id : array) {
			ArrayList<String> typeList = new ArrayList<String>();
			typeHandler.getAllByTree(id.toString())
				.forEach(type->typeList.add(type.toJson()));
			typeLists.add(typeList);
		}	
		out.println(typeLists);
	}

	private void updateDebtStatus(String commitId, String fileId, String debt, int status) {
		if (debt.equals("Code Debt")) {
			typeHandler.updateCodeDebtStatus(fileId, commitId, status);
		}
		else if (debt.equals("Design Debt")){
			typeHandler.updateDesignDebtStatus(fileId, commitId, status);
		}
		
	}
	
	private void confirmAllDebtsByTag(String treeId) {
		typeHandler.confirmAllDebtsByTag(treeId);		
	}
	
	private void confirmAllDebtsByRepository(String repositoryId) {
		typeHandler.confirmAllDebtsByRepository(repositoryId);		
	}
	
	private void getTypeTimeline(String idRepository, String fileHash) {
		HashMap<Document, Document> timelineHash = typeHandler.getTypeTimeline(idRepository, fileHash);
		out.println(createTimelineList(timelineHash));
		
	}
	
	private List<String> createTimelineList(HashMap<Document, Document> timelineHash) {
		List<String> timeline = new ArrayList<>();
		for(Document tag : timelineHash.keySet()) {
			Document type = timelineHash.get(tag);
			Document document = new Document();
			document.append("tag", tag).append("type", type);
			timeline.add(document.toJson());
		}
		
		return timeline;
	}
}
